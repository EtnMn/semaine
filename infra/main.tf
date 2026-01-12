locals {
  resource_suffix = "${var.project_name}-${var.environment}"
}

# Resource Group for the application
module "resource_group" {
  source = "./modules/resource-group"

  name     = "rg-${local.resource_suffix}"
  location = var.location
  tags     = var.tags
}

# Azure Static Web App
module "static_web_app" {
  source = "./modules/static-web-app"

  name                = "stapp-${local.resource_suffix}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  sku_tier            = var.static_web_app_sku_tier
  tags                = var.tags
}
