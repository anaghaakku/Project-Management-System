package handlers

import (
    "net/http"
    "strconv"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "project-management-system/internal/models"
    "project-management-system/internal/utils"
)

func CreateUser(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var user models.User

        if err := c.ShouldBindJSON(&user); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
            return
        }

        var existing models.User
        if err := db.Where("email = ?", user.Email).First(&existing).Error; err == nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
            return
        }

        
        hashed, err := utils.HashPassword(user.Password)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
            return
        }
        user.Password = hashed

        if err := db.Create(&user).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        c.JSON(http.StatusCreated, gin.H{
            "message": "User created successfully",
            "user": gin.H{
                "id":    user.ID,
                "name":  user.Name,
                "email": user.Email,
                "role":  user.Role,
            },
        })
    }
}

func ListUsers(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var users []models.User

        page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
        limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

        if page < 1 {
            page = 1
        }
        if limit < 1 || limit > 100 {
            limit = 10
        }

        offset := (page - 1) * limit

        var total int64
        db.Model(&models.User{}).Count(&total)

        if err := db.Offset(offset).Limit(limit).Find(&users).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "data": users,
            "pagination": gin.H{
                "page":       page,
                "limit":      limit,
                "total":      total,
                "totalPages": (total + int64(limit) - 1) / int64(limit),
            },
        })
    }
}