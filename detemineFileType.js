const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const fileTypes = [
    { type: 'png', bytesToRead: 8, hex: '89504e470d0a1a0a'},
    { type: 'jpeg', bytesToRead: 2, hex: 'ffd8' },
    { type: 'gif', bytesToRead: 6, hex: '474946383961' },
    { type: 'pdf', bytesToRead: 4, hex: '25504446' },
    { type: 'mp3', bytesToRead: 2, hex: 'fffb' },
    { type: 'bmp', bytesToRead: 2, hex: '424d' },
    { type: 'tiff', bytesToRead: 4, hex: '49492a00' },
    { type: 'ico', bytesToRead: 4, hex: '00000100' },
    { type: 'mp4', bytesToRead: 8, hex: '667479704d534e56' },
    { type: 'webm', bytesToRead: 4, hex: '1a45dfa3' },
    { type: 'avi', bytesToRead: 4, hex: '52494646' },
    { type: 'wav', bytesToRead: 4, hex: '52494646' },
    { type: 'flv', bytesToRead: 4, hex: '464c5601' },
    { type: 'mov', bytesToRead: 8, hex: '0000002066747970' },
    { type: 'ps1', bytesToRead: 5, hex: '23212f62696e2f73' }, // PowerShell Script
    { type: 'bat', bytesToRead: 2, hex: '4045' },
    { type: 'msi', bytesToRead: 4, hex: '4d534931' },
    { type: 'iso', bytesToRead: 4, hex: '43443030' },
    { type: 'zip', bytesToRead: 4, hex: '504b0304' },
    { type: 'docx', bytesToRead: 4, hex: '504b0304' }, 
    { type: 'odt', bytesToRead: 4, hex: '504b0304' },
    { type: 'pptx', bytesToRead: 4, hex: '504b0304' }, 
    { type: 'xlsx', bytesToRead: 4, hex: '504b0304' },
    { type: 'doc', bytesToRead: 8, hex: 'd0cf11e0a1b11ae1' }, 
    { type: 'xls', bytesToRead: 8, hex: 'd0cf11e0a1b11ae1' },
    { type: 'ppt', bytesToRead: 8, hex: 'd0cf11e0a1b11ae1' }, // Microsoft PowerPoint 97-2003
    { type: 'rtf', bytesToRead: 5, hex: '7b5c727466' }, // Rich Text Format
    { type: 'sys', bytesToRead: 2, hex: '5a4d' }, 
    { type: 'cmd', bytesToRead: 5, hex: '23696e636c' }, // Windows Command Script
    { type: 'vbs', bytesToRead: 12, hex: '4d6963726f736f66742057696e646f777320536372697074' }, // VBScript
    { type: 'ps1', bytesToRead: 5, hex: '23212f62696e2f73' }, // PowerShell Script
    { type: 'lnk', bytesToRead: 4, hex: '4c000000' }, // Windows Shortcut (LNK)
    { type: 'dll', bytesToRead: 2, hex: '4d5a' }, // Dynamic Link Library
    { type: 'sys', bytesToRead: 2, hex: '4d5a' }, // System file (similar to DLL)
    { type: 'exe', bytesToRead: 2, hex: '4d5a' },
    { type: 'com', bytesToRead: 2, hex: '4d5a' }, // MS-DOS Executable (COM)
    { type: 'exe', bytesToRead: 2, hex: '4d5a' }, // Windows Executable (PE)
    { type: 'dll', bytesToRead: 2, hex: '4d5a' }, // Windows Dynamic Link Library (PE)
    { type: 'ocx', bytesToRead: 2, hex: '4d5a' }, // ActiveX Control (PE)
    { type: 'scr', bytesToRead: 2, hex: '4d5a' }, // Windows Screen Saver (PE)
    { type: 'reg', bytesToRead: 2, hex: '52554e4b' }, // Windows Registry File (text)
    { type: 'cab', bytesToRead: 4, hex: '4d534346' }
  ];


function detectFileType(filePath) {
  function readMagicNumber(bytesToRead) {
    const buffer = Buffer.alloc(bytesToRead);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, bytesToRead, 0);
    fs.closeSync(fd);
    return buffer.toString('hex');
  }

  // Read the first 16 bytes of the file
  const bufOfSelectedFile = readMagicNumber(16);
  const ext = path.extname(filePath).slice(1).toLowerCase(); // Extract file extension

  let type = 'Unknown';

  for (const fileType of fileTypes) {
    const hexValues = fileType.hex.toLowerCase();
    if (bufOfSelectedFile.startsWith(hexValues)) {
      type = fileType.type;
      break;
    }
  }

  if (type === 'docx' || type === 'zip' || type === 'odt' || type === 'pptx' || type === 'xlsx') {
    type = checkForZipTypes(filePath);
  }
  if (['sys', 'exe', 'com', 'dll', 'ocx', 'scr'].includes(type)) {
    type = ext === type ? ext : 'sys/exe/dll/com/ocx/scr';
  }
  if (['doc', 'xls', 'ppt'].includes(type)) {
    type = ext === type ? ext : 'doc/ppt/xls';
  }
  if (['webm', 'mkv'].includes(type)) {
    type = ext === type ? ext : 'mkv/webm';
  }
  if (['avi', 'wav'].includes(type)) {
    type = ext === type ? ext : 'avi/wav';
  }

  if (type === 'Unknown') {
    type = readContentOfFile(filePath);
  }

  return {ext: ext, detectedFileType: type};
}

function readContentOfFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check for specific patterns in the content to identify the filetype
    if (content.includes('MZ') && content.includes('This program cannot be run in DOS mode')) {
      return 'exe'; // Executable file
    } else if (content.includes('@echo') || content.includes('echo ')) {
      return 'bat'; // Batch file
    } else if (content.includes('function') || content.includes('$') || content.includes('Invoke-Command') || content.includes('Write-Host')) {
      return 'ps1'; // PowerShell script
    } else if (content.includes('From:')
      && content.includes('To:')
      && content.includes('Subject:')
      && (content.includes('Date:') || content.includes('Received:'))
    ) {
      return 'eml';
    } else if (content.includes('def ') || content.includes('import ') || content.includes('print(')) {
      return 'py'; // It's likely a Python file
    } else {
      return 'Unknown'; // Default to text file
    }
  } catch (error) {
    return 'Unknown'; // If an error occurs, return unknown type
  }
}

function checkForZipTypes(filePath) {
  try {
    // Read the ZIP file
    const zipFile = fs.readFileSync(filePath);

    // Create an instance of AdmZip
    const zip = new AdmZip(zipFile);

    // Get the entries (files and directories) in the ZIP archive
    const entries = zip.getEntries();

    // Extract the names of the entries
    const entryNames = entries.map(entry => entry.entryName);

    // Check for specific files indicative of certain formats
    if (entryNames.includes('word/document.xml')) {
      return 'docx';
    } else if (entryNames.includes('xl/workbook.xml')) {
      return 'xlsx';
    } else if (entryNames.includes('ppt/presentation.xml')) {
      return 'pptx';
    } else if (entryNames.includes('content.xml')) {
      return 'odt';
    } else {
      return 'zip';
    }
  } catch (error) {
    console.log(error);
    return 'zip/xlsx/docx/pptx/odt';
  }
}



module.exports = detectFileType;