locals {
  resource_suffix = "${var.app_name}-${var.environment}"
  tags = {
    "environment" = var.environment,
    "application" = var.app_name
  }
}

# Resource Group for the application
module "resource_group" {
  source = "./modules/resource-group"

  name     = "rg-${local.resource_suffix}"
  location = var.location
  tags     = local.tags
}

# Azure Static Web App
module "static_web_app" {
  source = "./modules/static-web-app"

  name                = "stapp-${local.resource_suffix}"
  location            = module.resource_group.location
  resource_group_name = module.resource_group.name
  sku_tier            = var.static_web_app_sku_tier
  tags                = local.tags
}
