## [SPLITZ.Web.App](https://splitz.web.app) 
#### ...Simply Plan Life In TaskZ

![Demo](https://user-images.githubusercontent.com/22216995/187179502-039bbfbb-d437-4771-8d3c-01d988439804.png)

### Features
- Task Manager - a redefined way to be organized
- Money Manager - a simpler way to track your expenses
- Contacts Manager - build your social profiles while collaborating
- Inverstment Manager - see your investments and manage them easily
- Assets Manager - never forget where and how many assets you have
- Business Manager - have an overview of your business

---
### Getting Started
Clone the repo then,
Install Dependancies

### Configure
- Create a firebase project or get the firebase config files of the one you already have
    ```
    apiKey: "",
    authDomain: "",
    projectId: ""
   ```
- Update the [src/KEYS](./src/KEYS.js) config files with your above keys

#### Test Locally
`npm run dev`

#### Build for production
`npm run build`

---

Your files will be available in the [dist](./dist) folder.
To push the files to your firebase hosting, run the commands below. Make sure to fill the dist folder as your hosting one.

`firebase init hosting,functions && firebase deploy`

New version available!

# Made With ♥
```
(                   (                            
)\ )                )\ )                         
(()/(     (    )    (()/(   (          (     )    
/(_))   ))\  /((    /(_)) ))\   (    ))\   (     
(_))_   /((_)(_))\  (_))  /((_)  )\  /((_)  )\  '
|   \ (_))  _)((_) | |  (_))(  ((_)(_))  _((_))  
| |) |/ -_) \ V /  | |__| || |/ _| / -_)| '  \()
|___/ \___|  \_/   |____|\_,_|\__| \___||_|_|_|  
```
