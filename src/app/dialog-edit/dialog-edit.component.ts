import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'dialog-edit',
  templateUrl: 'dialog-edit.component.html',
})
export class DialogEditDialog {
  data = {
    type: "",
    status: ""
  };
  typeList: string[] = ["Инициация",
    "Лекция",
    "Сатсанг",
    "Краткое наставление",
    "Доклады монахов",
    "Доклады учеников-мирян",
    "Лекции монахов",
    "Самайное",
    "4БСБ",
    "Ритуал",
    "Параяна",
    "Праздник",
    "Архив качества",
    "Комментарий к тексту",
    "Ответы на вопросы",
    "Дополнительно",
    'Семинар'];

    statusList = [
      "Не обработан",
      "В обработке",
      "На проверке",
      "Обработан",
      "Отсутствует",
      "Проверено",
      "Сконвертировано",
      "Готово"
    ]

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public d: any,
  ) {
    this.data = d;
  }

  save() {
    this.dialogRef.close(this.data);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
