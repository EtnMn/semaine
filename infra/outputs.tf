output "resource_group_name" {
  description = "Name of the resource group"
  value       = module.resource_group.name
}

output "resource_group_id" {
  description = "ID of the resource group"
  value       = module.resource_group.id
}

output "static_web_app_name" {
  description = "Name of the Static Web App"
  value       = module.static_web_app.name
}

output "static_web_app_id" {
  description = "ID of the Static Web App"
  value       = module.static_web_app.id
}

output "static_web_app_default_hostname" {
  description = "Default hostname of the Static Web App"
  value       = module.static_web_app.default_hostname
}

output "static_web_app_api_key" {
  description = "API key for deployment (sensitive)"
  value       = module.static_web_app.api_key
  sensitive   = true
}
