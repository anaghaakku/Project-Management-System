package handlers

import (
    "log"
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "project-management-system/internal/models"
)

func CreateProject(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var project models.Project

        // Log the request body
        log.Printf("📥 CreateProject called")

        if err := c.ShouldBindJSON(&project); err != nil {
            log.Printf("❌ Failed to bind JSON: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        log.Printf("📦 Project data: %+v", project)

        // Get user ID from context (set by auth middleware)
        userID, exists := c.Get("userID")
        if !exists {
            log.Printf("❌ User not authenticated")
            c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
            return
        }

        // ✅ Start transaction
        tx := db.Begin()

        project.CreatedBy = userID.(uint)
        log.Printf("👤 User ID: %d", project.CreatedBy)

        // Validate user exists
        var user models.User
        if err := tx.First(&user, project.CreatedBy).Error; err != nil {
            tx.Rollback()
            log.Printf("❌ User not found: %v", err)
            c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
            return
        }

        // Create project
        if err := tx.Create(&project).Error; err != nil {
            tx.Rollback()
            log.Printf("❌ Database error: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        // ✅ Commit transaction
        tx.Commit()

        log.Printf("✅ Project created: ID=%d, Name=%s", project.ID, project.Name)
        c.JSON(http.StatusCreated, project)
    }
}

func ListProjects(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        // ✅ Get pagination parameters
        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

        if page < 1 {
            page = 1
        }
        if limit < 1 || limit > 100 {
            limit = 10
        }

        offset := (page - 1) * limit

        var projects []models.Project
        var total int64

        // Get total count
        db.Model(&models.Project{}).Count(&total)

        // Get paginated results
        if err := db.Offset(offset).Limit(limit).Find(&projects).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "data": projects,
            "pagination": gin.H{
                "page":       page,
                "limit":      limit,
                "total":      total,
                "totalPages": (total + int64(limit) - 1) / int64(limit),
            },
        })
    }
}

func UpdateProject(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")

        // ✅ Start transaction
        tx := db.Begin()

        var project models.Project
        if err := tx.First(&project, id).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
            return
        }

        if err := c.ShouldBindJSON(&project); err != nil {
            tx.Rollback()
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        if err := tx.Save(&project).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        // ✅ Commit transaction
        tx.Commit()

        c.JSON(http.StatusOK, project)
    }
}

func DeleteProject(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        id := c.Param("id")

        // ✅ Start transaction
        tx := db.Begin()

        // Check if project exists
        var project models.Project
        if err := tx.First(&project, id).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusNotFound, gin.H{"error": "Project not found"})
            return
        }

        // Delete related tasks first (cascade)
        if err := tx.Where("project_id = ?", id).Delete(&models.Task{}).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete tasks"})
            return
        }

        // Delete project
        if err := tx.Delete(&models.Project{}, id).Error; err != nil {
            tx.Rollback()
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        // ✅ Commit transaction
        tx.Commit()

        c.JSON(http.StatusOK, gin.H{"message": "Project deleted successfully"})
    }
}