terraform {
  required_version = ">= 1.14.3"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.57"
    }
  }
}

provider "azurerm" {
  features {}

  # Use OIDC authentication (Workload Identity Federation)
  use_oidc = true
}
