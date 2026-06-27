package models

import (
    "time"
    "gorm.io/gorm"
)

type Project struct {
    ID          uint           `gorm:"primaryKey" json:"id"`
    Name        string         `gorm:"not null" json:"name"`
    Description string         `json:"description"`
    CreatedBy   uint           `json:"created_by"`  
    CreatedAt   time.Time      `json:"created_at"`
    UpdatedAt   time.Time      `json:"updated_at"`
    DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}