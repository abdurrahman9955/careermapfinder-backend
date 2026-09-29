import { Readable } from 'stream';
import csv from 'csv-parser';
import * as XLSX from 'xlsx';

const parseSingleFile = async (file: Express.Multer.File): Promise<any[]> => {
    const { originalname, buffer, mimetype } = file;
    
    const extension = originalname.split('.').pop()?.toLowerCase();

    console.log(`Starting parsing for single file: ${originalname} (Type: ${extension})`);

    switch (extension) {
        case 'csv':
            return new Promise((resolve, reject) => {
                const results: any[] = [];
                const stream = Readable.from(buffer);
                stream
                    .pipe(csv())
                    .on('data', (data) => results.push(data))
                    .on('end', () => {
                        console.log(`Finished parsing CSV: ${originalname}, ${results.length} rows.`);
                        resolve(results);
                    })
                    .on('error', (err) => {
                         console.error(`Error parsing CSV file ${originalname}:`, err);
                         reject(new Error(`Failed to parse CSV file ${originalname}`));
                    });
            });
        case 'json':
            try {
                const jsonString = buffer.toString('utf-8');
                const parsedJson = JSON.parse(jsonString);
                const result = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
                console.log(`Finished parsing JSON: ${originalname}, ${result.length} items.`);
                return result;
            } catch (error) {
                console.error(`Error parsing JSON file ${originalname}:`, error);
                throw new Error(`Invalid JSON file format for ${originalname}.`);
            }
        case 'xlsx':
        case 'xls':
            try {
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const allSheetData: any[] = [];
                
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = workbook.Sheets[sheetName];
                    const sheetData = XLSX.utils.sheet_to_json(sheet);
                    allSheetData.push(...sheetData);
                });

                console.log(`Finished parsing XLSX: ${originalname}, ${allSheetData.length} items from all sheets.`);
                return allSheetData;
            } catch (error) {
                console.error(`Error parsing XLSX file ${originalname}:`, error);
                throw new Error(`Invalid XLSX/XLS file format for ${originalname}.`);
            }
        default:
            throw new Error(`Unsupported file type: ${mimetype} for file ${originalname}.`);
    }
};

/**
 * @param files 
 * @returns
 */
export const parseFiles = async (files: Express.Multer.File[] | Express.Multer.File): Promise<any[]> => {
    const fileArray = Array.isArray(files) ? files : (files ? [files] : []);

    if (fileArray.length === 0) {
        return [];
    }
    
    const fileParsingPromises = fileArray.map(file => 
        parseSingleFile(file).catch(error => {
            console.error(`[File Parse Skip] Skipped ${file.originalname} due to error: ${error.message}`);
            return []; 
        })
    );
    
    const allResultsArrays = await Promise.all(fileParsingPromises);
    return allResultsArrays.flat();
};


