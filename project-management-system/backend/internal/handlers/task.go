package handlers

import (
    "log"
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "project-management-system/internal/models"
)

func CreateTask(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var task models.Task

        log.Printf("📥 CreateTask called")

        if err := c.ShouldBindJSON(&task); err != nil {
            log.Printf("Failed to bind JSON: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        log.Printf(" Task data: %+v", task)

        tx := db.Begin()

        var project models.Project
        if err := tx.First(&project, task.ProjectID).Error; err != nil {
            tx.Rollback()
            log.Printf(" Project not found: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "Project not found"})
            return
        }
        var user models.User
        if err := tx.First(&user, task.AssignedTo).Error; err != nil {
            tx.Rollback()
            log.Printf(" User not found: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
            return
        }

        if task.Status == "" {
            task.Status = "pending"
        }

        if err := tx.Create(&task).Error; err != nil {
            tx.Rollback()
            log.Printf("Database error: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        tx.Commit()

        log.Printf(" Task created: ID=%d, Title=%s", task.ID, task.Title)
        c.JSON(http.StatusCreated, task)
    }
}

func ListTasks(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var tasks []models.Task

        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

        if page < 1 {
            page = 1
        }
        if limit < 1 || limit > 100 {
            limit = 10
        }

        offset := (page - 1) * limit

        
        query := db.Model(&models.Task{})

        
        if projectID := c.Query("project_id"); projectID != "" {
            query = query.Where("project_id = ?", projectID)
        }

       
        if status := c.Query("status"); status != "" {
            query = query.Where("status = ?", status)
        }

        if assignedTo := c.Query("assigned_to"); assignedTo != "" {
            query = query.Where("assigned_to = ?", assignedTo)
        }

        var total int64
        query.Count(&total)

        if err := query.Offset(offset).Limit(limit).Find(&tasks).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "data": tasks,
            "pagination": gin.H{
                "page":       page,
                "limit":      limit,
                "total":      total,
                "totalPages": (total + int64(limit) - 1) / int64(limit),
            },
        })
    }
}

func UpdateTaskStatus(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")

        var req struct {
            Status string `json:"status"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        
        validStatuses := map[string]bool{
            "pending":     true,
            "in_progress": true,
            "completed":   true,
        }

        if !validStatuses[req.Status] {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status. Must be: pending, in_progress, or completed"})
            return
        }

        tx := db.Begin()

        var task models.Task
        if err := tx.First(&task, id).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Task not found"})
            return
        }

        task.Status = req.Status

        if err := tx.Save(&task).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        tx.Commit()

        c.JSON(http.StatusOK, task)
    }
}