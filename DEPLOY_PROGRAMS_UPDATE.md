# How to Deploy the Programs & Episodes Update Safely

When you are ready to deploy the `parent_id` feature for the Programs to the production server tonight, follow these exact steps in your server's SSH terminal (`almada@almada:~$`).

### Step 1: Navigate to your project directory
Type the command to go into your main project folder. *(If you don't remember the exact path, type `ls` to find it)*
```bash
# Example: cd /var/www/injaz or cd al-mada-newspaper
cd /path/to/your/project
```

### Step 2: Pull the latest changes from GitHub
Once inside the project folder, pull the `schema.prisma` update that we just pushed to GitHub:
```bash
git pull origin main
```

### Step 3: Navigate to the admin folder
Go into the `admin` directory where the Prisma database files live:
```bash
cd admin
```

### Step 4: Safely Update the Database
Run the Prisma push command. Because we only added an *optional* column (`parent_id`), this will safely add the field to your database **without touching or deleting any existing data**:
```bash
npx prisma db push
```

### Step 5: Restart Your Application
Finally, restart your server processes so it loads the new database schema. If you are using PM2, the command is usually:
```bash
pm2 restart all
```

---
> **Note:** The local changes have already been safely committed and pushed to your GitHub repository `origin/main` by the AI. You only need to run the 5 steps above on the server tonight!
