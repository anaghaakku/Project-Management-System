package main

import (
    "io"
    "log"
    "os"
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
    "golang.org/x/crypto/bcrypt"
    "project-management-system/internal/database"
    "project-management-system/internal/handlers"
    "project-management-system/internal/middleware"
    "project-management-system/internal/models"
    "project-management-system/internal/utils"
)

func main() {
    godotenv.Load()

    db, err := database.Connect()
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    db.AutoMigrate(&models.User{}, &models.Project{}, &models.Task{})

    r := gin.Default()

    
    r.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

    r.POST("/api/auth/login", handlers.Login(db))
    r.POST("/api/auth/register", handlers.Register(db))

    r.POST("/api/test-bcrypt", func(c *gin.Context) {
        var req struct {
            Password string `json:"password"`
            Hash     string `json:"hash"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }

        err := bcrypt.CompareHashAndPassword([]byte(req.Hash), []byte(req.Password))
        c.JSON(200, gin.H{
            "match": err == nil,
            "error": err.Error(),
        })
    })

    r.POST("/api/debug-login", func(c *gin.Context) {
        body, _ := io.ReadAll(c.Request.Body)
        c.JSON(200, gin.H{
            "raw": string(body),
        })
    })

    r.POST("/api/debug-auth", func(c *gin.Context) {
        var req struct {
            Email    string `json:"email"`
            Password string `json:"password"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }

        var user models.User
        if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
            c.JSON(401, gin.H{"error": "User not found"})
            return
        }

        err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))

        c.JSON(200, gin.H{
            "email":         req.Email,
            "stored_hash":   user.Password,
            "hash_length":   len(user.Password),
            "password":      req.Password,
            "password_len":  len(req.Password),
            "bcrypt_match":  err == nil,
            "bcrypt_error":  err.Error(),
        })
    })

    r.POST("/api/create-user", func(c *gin.Context) {
        var req struct {
            Name     string `json:"name"`
            Email    string `json:"email"`
            Password string `json:"password"`
            Role     string `json:"role"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }

        var existing models.User
        if err := db.Where("email = ?", req.Email).First(&existing).Error; err == nil {
            c.JSON(400, gin.H{"error": "Email already registered"})
            return
        }

        
        hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
        if err != nil {
            c.JSON(500, gin.H{"error": "Failed to hash password"})
            return
        }

        user := models.User{
            Name:     req.Name,
            Email:    req.Email,
            Password: string(hashed),
            Role:     req.Role,
        }

        if err := db.Create(&user).Error; err != nil {
            c.JSON(500, gin.H{"error": err.Error()})
            return
        }

        c.JSON(201, gin.H{
            "message": "User created successfully",
            "hash":    string(hashed),
            "user": gin.H{
                "id":    user.ID,
                "name":  user.Name,
                "email": user.Email,
                "role":  user.Role,
            },
        })
    })

    
    r.POST("/api/test-login", func(c *gin.Context) {
        var req struct {
            Email string `json:"email"`
        }
        if err := c.ShouldBindJSON(&req); err != nil {
            c.JSON(400, gin.H{"error": err.Error()})
            return
        }

        var user models.User
        if err := db.Where("email = ?", req.Email).First(&user).Error; err != nil {
            c.JSON(401, gin.H{"error": "User not found"})
            return
        }

        token, err := utils.GenerateToken(user.ID, user.Email, user.Role)
        if err != nil {
            c.JSON(500, gin.H{"error": "Failed to generate token"})
            return
        }

        c.JSON(200, gin.H{
            "token": token,
            "user": gin.H{
                "id":    user.ID,
                "name":  user.Name,
                "email": user.Email,
                "role":  user.Role,
            },
        })
    })

    r.GET("/api/debug-auth-test", middleware.AuthMiddleware(), func(c *gin.Context) {
        userID, exists := c.Get("userID")
        email, _ := c.Get("email")
        role, _ := c.Get("role")
        c.JSON(200, gin.H{
            "authenticated": exists,
            "userID":        userID,
            "email":         email,
            "role":          role,
        })
    })

    api := r.Group("/api")
    api.Use(middleware.AuthMiddleware())

    api.POST("/users", handlers.CreateUser(db))
    api.GET("/users", handlers.ListUsers(db))
    api.POST("/projects", handlers.CreateProject(db))
    api.GET("/projects", handlers.ListProjects(db))
    api.PUT("/projects/:id", handlers.UpdateProject(db))
    api.DELETE("/projects/:id", handlers.DeleteProject(db))
    api.POST("/tasks", handlers.CreateTask(db))
    api.GET("/tasks", handlers.ListTasks(db))
    api.PUT("/tasks/:id/status", handlers.UpdateTaskStatus(db))

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    r.Run(":" + port)
}