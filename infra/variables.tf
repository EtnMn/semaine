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

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "etn-semaine"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    project    = "etn-semaine"
    managed_by = "terraform"
    repository = "EtnMn/semaine"
  }
}

variable "static_web_app_sku_tier" {
  description = "SKU tier for Azure Static Web App (Free or Standard)"
  type        = string
  default     = "Free"
}
