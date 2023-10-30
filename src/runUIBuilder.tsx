import { bitable, FieldType, IField, IRecordValue, ITable, UIBuilder } from "@lark-base-open/js-sdk";
import { use } from "i18next";
import { UseTranslationResponse } from 'react-i18next';
import NickNameDataList from './data';
export default async function(uiBuilder: UIBuilder, { t }: UseTranslationResponse<'translation', undefined>) {
  uiBuilder.showLoading(t('Getting data'));
  const {options,table,fieldList,nicknameList} = await initData();
  let nicknameListCopy = [...nicknameList];
  if (options.length === 0) {
    uiBuilder.hideLoading();
    uiBuilder.text(t('No field type'));
    return;
  }
  uiBuilder.form((form) => ({
    formItems: [
      form.select('field', 
        { label: t('Field'), options: 
        options, defaultValue: options[0].value }),
    ],
    buttons: [t('Insert')],
  }), async ({ values }) => {
    const { field} = values;
    const tb = table as ITable;
    const fd = fieldList.find(item=>item.id === field) as IField;
    if (!fd) {
      uiBuilder.message.error(t('Please select the fields to fill in'));
      return;
    }
    uiBuilder.showLoading(t('Begin execution'));
    const recordIdList = new Set((await tb.getRecordIdList()));
    const fieldValueList = (await fd.getFieldValueList()).map(({ record_id }) => record_id);
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
          [fd.id]: n,
        }
      }
    })
    if (toSetTask.length === 0) {
      uiBuilder.hideLoading();
      uiBuilder.message.warning(t('No data'));
      return;
    }
    uiBuilder.showLoading(t('About to insert n random nicknames',{n:toSetTask.length}));
    const step = 5000;
    let hasError = false;
    for (let index = 0; index < toSetTask.length; index += step) {
      const element = toSetTask.slice(index, index + step);
      await tb.setRecords(element).then(() => {
        console.log('执行完成');
      }).catch((e) => {
        hasError = true;
        console.log(e);
      });
    }
    uiBuilder.hideLoading();
    if (hasError) {
      uiBuilder.message.error(t('Insertion failed, please try again'));
    } else {
      uiBuilder.message.success(t('Inserted successfully'));
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