variable "name" {
  description = "Name of the Static Web App"
  type        = string
}

variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
}

variable "location" {
  description = "Azure region for the Static Web App"
  type        = string
}

variable "sku_tier" {
  description = "SKU tier for the Static Web App (Free or Standard)"
  type        = string
  default     = "Free"

  validation {
    condition     = contains(["Free", "Standard"], var.sku_tier)
    error_message = "SKU tier must be either 'Free' or 'Standard'."
  }
}

variable "sku_size" {
  description = "SKU size for the Static Web App"
  type        = string
  default     = "Free"
}

variable "tags" {
  description = "Tags to apply to the Static Web App"
  type        = map(string)
  default     = {}
}
