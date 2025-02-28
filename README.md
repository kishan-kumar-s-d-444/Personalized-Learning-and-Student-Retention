# **Backend Setup**

## **1. Create and Configure the `.env` File**
- **Location:** `PLSR/backend/` (Create the file if it does not exist)
- **Content:**
  
  ```env
  MONGO_URL=//Add your Mongodb Cloud URL
  PORT=5000

  CLOUDINARY_CLOUD_NAME=//Add your Cloudinary cloud name
  CLOUDINARY_API_KEY=//Add your Cloudinary API_KEY
  CLOUDINARY_API_SECRET=//Add your Cloudinary API secret
  
  DB_HOST=localhost
  DB_USER=root
  DB_PASS=//Add your local MySQL password
  DB_NAME=//Add your MySQL database name (ensure it is created manually in MySQL)
  ```

- **Note:** Create the above credentials if not done already through [Cloudinary Console](https://console.cloudinary.com/users/login).

---

## **2. MySQL Setup**
- Copy the SQL script from `PLSR/SQL/all.sql` and paste it into the database created in Step 1.
- Execute the entire SQL script to initialize the database.

---

## **3. Setup Python Virtual Environment and Install Libraries**
- **Location:** `PLSR/backend`
- **Commands:**

  ```sh
  python -m venv env
  env\Scripts\activate  # Windows
  # For Mac/Linux: source env/bin/activate
  
  # Install required libraries
  pip install -r requirements.txt
  ```

---

## **4. Running the Project in Terminal**

### **Start the Backend (Node.js)**
```sh
cd PLSR/backend
npm start
```

### **Start the Python Backend**
```sh
cd PLSR/backend
python -m venv env
env\Scripts\activate  # Windows
# For Mac/Linux: source env/bin/activate
python app.py
```

### **Start the Frontend**
```sh
cd PLSR/frontend
npm start
```

Now your project should be running successfully! 🚀
