import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})



// dekho yhn pr humne direct storage isliye export nhi kiya kyunki woh multer ka ek indtance hai to agr humko
//  use krna hai to uske  liye hame usse aese hi export krna hoga agr hamne aese export nhi kiya to jhn jhn isse
//  use krna hoga hame phle isko instance banana hoga phir use kr paenge soo hmesha aese hi multe rko export krte
//  hai

/// **** diskstorage and memory storage m difference 
// Stores files either:
// On disk (diskStorage) → Saves files in a directory.
// In memory (memoryStorage) → Keeps files in RAM (useful for further processing before storing elsewhere).

// now thoda bhut multer k documentation se padh lena kaise use krte hai yhn to bss ek instance bnaye hai 
// isko use bhut taeike se kr skte hai jaise ek file k liye alg doo k lye ag and multiple k liye sab documentation
//  ma hai 

// multer m cb k andr null jhn likha woh error k represent krta hai ab yhn pr noerror to hum null use krte hai 