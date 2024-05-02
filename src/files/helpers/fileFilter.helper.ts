export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    if (!file) return callback(new Error('File is empty'), false);
    //callback(new Error('File is empty'), false); Ese false signifca que no se acepta el archivo

    const fileExtension = file.mimetype.split('/')[1];

    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if(validExtensions.includes(fileExtension)) {
        return callback(null, true);
        //callback(null, true); significa null que no hay error, true que acepta el archivo
    }

    callback(null, false);
}