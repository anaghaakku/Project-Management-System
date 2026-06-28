package handlers

import (
    "log"
    "net/http"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
    "golang.org/x/crypto/bcrypt"
    "project-management-system/internal/models"
    "project-management-system/internal/utils"
)

func Login(db *gorm.DB) gin.HandlerFunc {
    return func(c *gin.Context) {
        var req struct {
            Email    string `json:"email" binding:"required,email"`
            Password string `json:"password" binding:"required"`
        }

        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
            return
        }

        var user models.User
        if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }

        log.Printf(" Stored hash: %s (length: %d)", user.Password, len(user.Password))
        log.Printf(" Provided password: %s (length: %d)", req.Password, len(req.Password))

        err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
        log.Printf(" bcrypt error: %v", err)

        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
            return
        }

        token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
        if err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
            return
        }

        c.JSON(http.StatusOK, gin.H{
            "token": token,
            "user": gin.H{
                "id":    user.ID,
                "name":  user.Name,
                "email": user.Email,
                "role":  user.Role,
            },
        })
    }
}

func Register(db *gorm.DB) gin.HandlerFunc {
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

        hashed, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
        if err != nil {
            log.Printf(" Failed to hash password: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
            return
        }
        user.Password = string(hashed)

        log.Printf(" Hashed password for %s: %s (length: %d)", user.Email, user.Password, len(user.Password))

        if err := db.Create(&user).Error; err != nil {
            log.Printf(" Database error while creating user: %v", err)
            c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
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