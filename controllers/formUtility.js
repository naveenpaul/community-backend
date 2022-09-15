const ExcelJs = require("exceljs");

function FormUtility(){};

FormUtility.prototype.downloadAssessment = (assessment, res, callback) => {
  const workbook = new ExcelJs.Workbook();
  const workSheet = workbook.addWorksheet("Form");
  // console.log(assessment);
  workSheet.columns = [
    { header: "Question", key: "question", width: 50 },
    { header: "Response", key: "response", width: 50 },
  ];
  let rowNumber = 1;

  assessment.fields.forEach((field, ind) => {
    rowNumber++;
    if (field.type === "heading") {
      workSheet.addRow({});
      workSheet.mergeCells("A" + rowNumber + ":B" + rowNumber);
      rowNumber++;
      workSheet.addRow({
        question: field.headline,
      });
      workSheet.getRow(rowNumber).eachCell((cell) => {
        cell.font = { bold: true };
      });
      workSheet.mergeCells("A" + rowNumber + ":B" + rowNumber);
    } else if (field.type === "table") {
      // console.log('table:',field.table.rows[0]);
      workSheet.addRow({
        question: field.questionTitle,
      });

      workSheet.mergeCells("A" + rowNumber + ":B" + rowNumber);
      rowNumber++;

      let columnData = [];

      field.table.columnHeaders.forEach((header) => {
        columnData.push({
          name: header.title,
          width: 50,
        });
      });

      let rowData = [];
      field.table.rows.forEach((row) => {
        let currRow = [];
        row.columns.forEach((rowData) => {
          currRow.push(rowData.content);
        });
        rowData.push(currRow);
      });

      workSheet.addTable({
        name: field.questionTitle,
        ref: "A" + rowNumber,
        headerRow: true,
        columns: columnData,
        rows: rowData,
        showColumnStripes: true,
      });

      for (let ind = rowNumber; ind < rowNumber + rowData.length; ind++) {
        for (let colInd = 1; colInd <= columnData.length; colInd++) {
          workSheet.getColumn(colInd).width = 50;
        }
      }

      rowNumber += rowData.length;
    } else if (field.type === "checklist") {
      let finalResponse = "";
      field.options.forEach((option) => {
        if (option.isSelected) {
          finalResponse += option.title + ",";
        }
      });
      if (finalResponse.length > 0)
        finalResponse[finalResponse.length - 1] = ".";
      workSheet.addRow({
        question: field.questionTitle,
        response: finalResponse,
      });
    } else {
      workSheet.addRow({
        question: field.questionTitle,
        response: field.response[0],
      });
      if (field.type === "fileUpload") {
        if (field.response.length !== 0 || field.response[0] !== "") {
          workSheet.getCell("B" + rowNumber).value = {
            text: field.response[0],
            hyperlink:
              "https://api-prod.oasisapp.io/file/download/" + field.response[0],
          };
        }
      }
    }
  });
  workSheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true };
  });
  let file = "downloads/form" + assessment._id + ".xlsx";
  workbook.xlsx.writeFile(file);
  callback(null, file);
};

module.exports=FormUtility