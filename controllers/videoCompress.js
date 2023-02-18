const fs = require("fs");
const ffmpeg = require('fluent-ffmpeg');
//created new file to fork the process for video compression
process.on("message", (payload) => {
    const { tempFilePath, name } = payload;
    const endProcess = (endPayload) => {
        const { statusCode, text,filename } = endPayload;
        // Remove temp file
        fs.unlink(tempFilePath, (err) => {
            if (err) {
                process.send({ statusCode: 500, text: err.message });
            }
        });
        // Format response so it fits the api response
        console.log(filename);
        process.send({ statusCode, text,filename });
        // End process
        process.exit();
    };
    fs.readFile(tempFilePath,(fileReadErr,filesData)=>{
            if (fileReadErr) {
              return common.sendErrorResponse(res, "Error in uploading file");
            }
        ffmpeg().input(tempFilePath)
        .fps(30)
        .addOptions(["-crf 28"])
        .on("end", () => {
            endProcess({ statusCode: 200, text: "Success" , filename:`${tempFilePath}.mp4`});
        })
        .on("error", (err) => {
            
            endProcess({ statusCode: 500, text: err.message,filename:`${tempFilePath}.mp4`});
        })
        .saveToFile(`${tempFilePath}.mp4`);
    })
    
});
