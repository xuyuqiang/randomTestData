import { bitable, FieldType, IField, IRecordValue, ITable, UIBuilder } from "@lark-base-open/js-sdk";
import { use } from "i18next";
import { UseTranslationResponse } from 'react-i18next';
import NickNameDataList from './data';
export default async function(uiBuilder: UIBuilder, { t }: UseTranslationResponse<'translation', undefined>) {
  uiBuilder.showLoading('获取数据...');
  const {options,table,fieldList,nicknameList} = await initData();
  let nicknameListCopy = [...nicknameList];
  if (options.length === 0) {
    uiBuilder.hideLoading();
    uiBuilder.text('没有符合要求的字段类型，只能操作文本类型的字段');
    return;
  }
  uiBuilder.form((form) => ({
    formItems: [
      form.select('field', 
        { label: '选择字段', options: 
        options, defaultValue: options[0].value }),
    ],
    buttons: ['插入'],
  }), async ({ values }) => {
    const { field} = values;
    const t = table as ITable;
    const f = fieldList.find(item=>item.id === field) as IField;
    if (!f) {
      uiBuilder.message.error(`请选择要填入的字段`);
      return;
    }
    uiBuilder.showLoading(`开始执行`);
    const recordIdList = new Set((await t.getRecordIdList()));
    const fieldValueList = (await f.getFieldValueList()).map(({ record_id }) => record_id);
    fieldValueList.forEach((id) => {
      recordIdList.delete(id!)
    })
    const toSetTask = [...recordIdList].map((recordId) => {
      const r = getRandomInt({
        min:0,
        max:nicknameListCopy.length-1,
      })
      const n = nicknameListCopy[r];
      nicknameListCopy = nicknameListCopy.filter((item)=>item!==n);
      return {
        recordId,
        fields: {
          [f.id]: n,
        }
      }
    })
    if (toSetTask.length === 0) {
      uiBuilder.hideLoading();
      uiBuilder.message.warning('没有需要插入的数据');
      return;
    }
    uiBuilder.showLoading(`即将插入${toSetTask.length}条随机昵称`);
    const step = 5000;
    let hasError = false;
    for (let index = 0; index < toSetTask.length; index += step) {
      const element = toSetTask.slice(index, index + step);
      await t.setRecords(element).then(() => {
        console.log('执行完成');
      }).catch((...e) => {
        hasError = true;
        console.log(e);
      });
    }
    uiBuilder.hideLoading();
    if (hasError) {
      uiBuilder.message.error("插入失败，请重试");
    } else {
      uiBuilder.message.success('插入成功');
    }
  });
  uiBuilder.hideLoading();
}

function getRandomInt({ min, max }: { min: number, max: number }) {
  const _max = Math.max(min, max);
  const _min = Math.min(min, max)
  min = Math.ceil(_min);
  max = Math.floor(_max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const initData = async () => {
  const aT = await bitable.base.getActiveTable();
  const fieldMetaList = await aT.getFieldMetaListByType(FieldType.Text);
  const fieldList = await aT.getFieldListByType(FieldType.Text);
  const options =  fieldMetaList.map(item=>{
    return {
      label:item.name,
      value:item.id,
  }});
  let nicknameList:string[] = [];
  NickNameDataList.forEach((item)=>{
    nicknameList = nicknameList.concat(item.list);
  },[]);
  return  {
    options,
    table:aT,
    fieldList,
    nicknameList,
  }
}