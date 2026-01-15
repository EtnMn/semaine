variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "westeurope"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "app_name" {
  description = "Application name used for resource naming"
  type        = string
  default     = "etn-semaine"
}

variable "static_web_app_sku_tier" {
  description = "SKU tier for Azure Static Web App (Free or Standard)"
  type        = string
  default     = "Free"
}

variable "subscription_id" {
  description = "Azure subscription ID (set in terraform.tfvars for local dev)"
  type        = string
  default     = null
}
