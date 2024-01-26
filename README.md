
# check-filetype-magicnumber

Detect file types based on magic numbers using Node.js.

## Installation

Install the package using npm:

```bash
npm install check-filetype-magicnumber


Usage - 


const path = require('path');
const detectFileType = require('check-filetype-magicnumber');

const filePath = path.join(__dirname, 'file_samples', 'Script.ps1');
const determinedType = detectFileType(filePath);

console.log('We detect Filetype To Be:', determinedType);



API
detectFileType(filePath: string): string
Detects the file type based on magic numbers.

filePath: The path to the file.
Returns an object 
{
    ext : '',   # file extension passed as an argument to function
    detectedFileType : ''   # Filetype detected based on magic numbers
}



Supported File Types
Images: png, jpeg, gif, bmp, tiff, ico
Documents: pdf, doc, xls, ppt, docx, xlsx, pptx, odt
Audio: mp3
Video: mp4, webm, avi, wav, flv, mov
Scripts: ps1, bat, vbs, cmd
Archives: zip
Executables: exe, dll, sys, com, ocx, scr
Miscellaneous: msi, iso, rtf, sys, lnk, reg, cab


License
This project is licensed under the MIT License - see the LICENSE file for details.