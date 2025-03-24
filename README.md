# 🚀 **Ai-SmartChat**  

Ai-SmartChat is a modern web application that enables users to **create multiple chat projects (groups)**, collaborate in **real time**, and interact with an **AI assistant**. Users can create projects, add collaborators, manage roles, and enjoy a seamless messaging experience with AI-powered responses triggered by the `@ai` prompt.  

---

## 🌟 **Features**  

### 🔹 **Multiple Projects/Groups**  
- Create and manage **multiple chat groups**.  
- Only project members can view and participate in a project.  

### ⚡ **Real-Time Chat**  
- Uses **Socket.io** for **instant messaging** and updates between collaborators.  

### 🤖 **AI Integration**  
- Type **`@ai`** in any message to trigger an AI response.  
- AI-generated responses are displayed in a **dedicated AI response section**.  

---

## 🔐 **Role Management**  

💪 **Admin Privileges:**  
- The **creator** of a project is **automatically the admin**.  
- Admins can **remove users** and **transfer admin rights** to other collaborators.  

🔄 **Automatic Admin Transfer:**  
- If an **admin exits a project**, admin rights are automatically transferred to the **next available collaborator**.  

👥 **Project Visibility:**  
- Users can **only view and interact** with projects in which they are involved.  

---

## 🛠 **Tech Stack**  

### **Frontend**  
- ⚡ **Vite-React**  
- 💻 **JavaScript**  
- 🎨 **Tailwind CSS**  
- 🌍 **Context API**  
- 🎭 **Aceternity UI**  

### **Backend**  
- 🏢 **Express & Node.js**  
- 🔄 **Socket.io (real-time communication)**  
- 🔑 **JWT (authentication)**  
- ⚡ **Redis (caching)**  
- 🔍 **Express Validator (input validation)**  
- 📂 **MongoDB (database)**  

---

## 📌 **Usage**  

### 🔹 **Create a Project**  
- **Sign in** and create a new project.  
- You will be **set as the default admin**.  

### 🔹 **Add Collaborators**  
- Invite other users to join your project.  
- Only **project members** can view and interact in the chat.  

### 🔹 **Real-Time Chat**  
- Chat with **collaborators in real time**.  
- Use **`@ai`** in your message to receive an **AI-generated response**.  

### 🔹 **Manage Roles**  
- **Admins** can remove users or **transfer admin rights**.  
- If an admin **leaves the project**, admin rights automatically **transfer to the next collaborator**.  

---

## 🔗 **Live Demo**  
🌍 **[Ai-SmartChat](https://ai-smart-chat-frontend.vercel.app/)**  

---

## 🎯 **Contributing**  

Contributions are **welcome**! Follow these steps to contribute:  

1️⃣ **Fork** the repository.  
2️⃣ Create a **new feature branch**:  
   ```sh
   git checkout -b feature/YourFeature
   ```  
3️⃣ Commit your changes:  
   ```sh
   git commit -am "Add new feature"
   ```  
4️⃣ Push the branch:  
   ```sh
   git push origin feature/YourFeature
   ```  
5️⃣ Open a **pull request**.  

---

## 📝 **License**  

🚨 **This project is licensed under the [MIT License](https://github.com/Sahil1849/aiSmartChat-frontend/blob/main/LICENSE).**.  

---

## 📩 **Contact**  

For any **questions, suggestions, or issues**, feel free to:  
- 📝 **Open an issue** in this repository.  
- 📧 Contact me at **ssbankar18@gmail.com**.  

---
