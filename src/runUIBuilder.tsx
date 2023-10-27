import { bitable, IField, IRecordValue, ITable, UIBuilder } from "@lark-base-open/js-sdk";
import { use } from "i18next";
import { useEffect } from "react";
import { UseTranslationResponse } from 'react-i18next';
import Data from './data';
export default async function(uiBuilder: UIBuilder, { t }: UseTranslationResponse<'translation', undefined>) {
  uiBuilder.markdown(`
  ## 欢迎使用 UIBuilder
  你可以在 \`uiBuilder.markdown\` 或者 \`uiBuilder.text\` 中输出交互内容
  `);
  uiBuilder.form((form) => ({
    formItems: [
      form.tableSelect('table', { label: '选择数据表' }),
      form.viewSelect('view', { label: '选择视图', sourceTable: 'table' }),
      form.fieldSelect('field', { label: '选择字段', sourceTable: 'table' }),
      // form.input('text', { label: '输入文本', defaultValue: '文本默认值' }),
      // form.inputNumber('number', { label: '输入数字', defaultValue: 28 }),
      // form.textArea('textArea', { label: '输入多行文本' }),
      // form.checkboxGroup('checkbox', { label: '选择水果', options: ['Apple', 'Orange'], defaultValue: ['Apple'] }),
      // form.select('select', { label: '下拉选择器', options: [], defaultValue: 'Apple' }),
    ],
    buttons: ['确定', '取消'],
  }), async ({ key, values }) => {
    const { table, view, field, text, number, textArea, checkbox, select } = values;
    // console.log('测试--',field,typeof field);
    const tableList = await bitable.base.getTableList();
    const t = table as ITable;
    const f = field as IField;
    const recordIdList = new Set((await t.getRecordIdList()));
    const fieldValueList = (await f.getFieldValueList()).map(({ record_id }) => record_id);
    fieldValueList.forEach((id) => {
      recordIdList.delete(id!)
    })
    const toSetTask = [...recordIdList].map((recordId) => ({
      recordId,
      fields: {
        [f.id]: getCellValue(),
      }
    }))
    console.log('我要操作的数据',toSetTask);
    const step = 5000;
    for (let index = 0; index < toSetTask.length; index += step) {
      const element = toSetTask.slice(index, index + step);
      const sleep = element.length
      await t.setRecords(element).then(() => {
        console.log('执行完成');
        // successCount += element.length;
        // setLoadingContent(t('success.num', { num: successCount }))
      }).catch((e) => {
        console.error(e)
      });
      // await new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve('')
      //   }, sleep);
      // })
    }
    uiBuilder.markdown(`你点击了**${key}**按钮`);

    // const recordIdList = new Set((await view?.table.getRecordIdList()));
  });
}

function getCellValue() {
  const len = Data.length;
  const r = getRandomInt({
    min:0,
    max:len-1,
  })
  return Data[r];
}

function getRandomInt({ min, max }: { min: number, max: number }) {
  const _max = Math.max(min, max);
  const _min = Math.min(min, max)
  min = Math.ceil(_min);
  max = Math.floor(_max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}