-- Create the users table for application accounts.
CREATE TABLE "User" (
    -- Primary key stored as text because Prisma used String + cuid().
    "id" TEXT NOT NULL,

    -- Login identifier. A unique index is added later.
    "email" TEXT NOT NULL,

    -- This will store the hashed password, not a plain-text password.
    "password" TEXT NOT NULL,

    -- Human-readable display name.
    "name" TEXT NOT NULL,

    -- Automatically set when the row is first created.
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Updated by the application/Prisma whenever the row changes.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create the products table for items that can be sold.
CREATE TABLE "Product" (
    -- Primary key.
    "id" TEXT NOT NULL,

    -- Product name shown in the UI.
    "name" TEXT NOT NULL,

    -- Stock keeping unit. Must be unique across products.
    "sku" TEXT NOT NULL,

    -- Money value stored as a fixed decimal, not float.
    "price" DECIMAL(10,2) NOT NULL,

    -- Current stock quantity.
    "stock" INTEGER NOT NULL DEFAULT 0,

    -- Creation timestamp.
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Last update timestamp.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- Create the sale header table.
-- One sale can contain multiple sale items.
CREATE TABLE "Sale" (
    -- Primary key.
    "id" TEXT NOT NULL,

    -- Optional customer name, so NULL is allowed.
    "customerName" TEXT,

    -- Total amount for the sale.
    "totalAmount" DECIMAL(10,2) NOT NULL,

    -- Creation timestamp.
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Last update timestamp.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- Create the sale line-items table.
-- Each row represents one product line inside a sale.
CREATE TABLE "SaleItem" (
    -- Primary key.
    "id" TEXT NOT NULL,

    -- Foreign key to the parent sale.
    "saleId" TEXT NOT NULL,

    -- Foreign key to the related product.
    "productId" TEXT NOT NULL,

    -- Snapshot of the product name at the time of sale.
    "productName" TEXT NOT NULL,

    -- Snapshot of the unit price at the time of sale.
    "unitPrice" DECIMAL(10,2) NOT NULL,

    -- Number of units sold in this line.
    "quantity" INTEGER NOT NULL,

    -- Snapshot total for this line: unitPrice * quantity.
    "lineTotal" DECIMAL(10,2) NOT NULL,

    -- Creation timestamp for the line item.
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id")
);

-- Enforce unique user emails at the database level.
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Enforce unique SKUs at the database level.
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- Link each sale item to a sale.
-- ON DELETE CASCADE means deleting a sale will also delete its line items.
-- ON UPDATE CASCADE means if the referenced sale id changed, the child key would update too.
ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_saleId_fkey"
FOREIGN KEY ("saleId") REFERENCES "Sale"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- Link each sale item to a product.
-- ON DELETE RESTRICT means you cannot delete a product if sale items still reference it.
-- This protects historical data integrity.
ALTER TABLE "SaleItem"
ADD CONSTRAINT "SaleItem_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;
