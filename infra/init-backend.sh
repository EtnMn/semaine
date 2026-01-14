ENV=Prod
APP_NAME="etn-semaine"
LOCATION=westeurope
RESOURCE_GROUP_NAME="rg-etn-semaine-tfstate"
TF_STORAGE_ACCOUNT=stetnsemaine${ENV,,}$RANDOM
CONTAINER_NAME=tfstate
LOCK_NAME=delete-lock

# Create resource group.
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# Create storage account.
az storage account create \
  --resource-group $RESOURCE_GROUP_NAME \
  --name $TF_STORAGE_ACCOUNT \
  --sku Standard_LRS \
  --allow-blob-public-access false \
  --tags 'ApplicationName='${APP_NAME}'' 'Env='${ENV} \
  --encryption-services blob

# Enable soft delete.
az storage account blob-service-properties update --account-name $TF_STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP_NAME \
    --enable-delete-retention true \
    --delete-retention-days 7

# Create storage container.
ACCOUNT_KEY=$(az storage account keys list --resource-group $RESOURCE_GROUP_NAME --account-name $TF_STORAGE_ACCOUNT --query '[0].value' -o tsv)
az storage container create --name $CONTAINER_NAME --account-name $TF_STORAGE_ACCOUNT --account-key $ACCOUNT_KEY

# Lock storage account.
az lock create --name $LOCK_NAME --resource-group $RESOURCE_GROUP_NAME --lock-type CanNotDelete --resource-type Microsoft.Storage/storageAccounts  --resource $TF_STORAGE_ACCOUNT
