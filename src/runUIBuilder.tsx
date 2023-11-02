import {
  bitable,
  FieldType,
  IField,
  ITable,
  UIBuilder,
} from '@lark-base-open/js-sdk';
import { UseTranslationResponse } from 'react-i18next';
import NickNameDataList,{NicknamePrefix} from './data';
import i18n from './i18n';
export default async function (
  uiBuilder: UIBuilder,
  { t }: UseTranslationResponse<'translation', undefined>
) {
  // console.log('当前语言',i18n.language);
  uiBuilder.showLoading(t('Getting data'));
  console.time('initData');
  const { options, table, fieldList, sourceOptions, nicknameList } =
    await initData();
  console.timeEnd('initData');
  console.log('initData-end');
  // console.log('一共有',nicknameList.length,'个昵称');
  // let nicknameListCopy = [...nicknameList];
  if (options.length === 0) {
    uiBuilder.hideLoading();
    uiBuilder.text(t('No field type'));
    return;
  }
  uiBuilder.markdown(
    t(
      `## ${t(
        'Select the field to be inserted, and after clicking Insert, the blank record will be automatically filled with a random nickname.'
      )}`
    )
  );
  uiBuilder.form(
    (form) => ({
      formItems: [
        form.select('field', {
          label: t('Field'),
          options: options,
          defaultValue: options[0].value,
        }),
        form.select('source', {
          label: t('nicknamesource'),
          options: sourceOptions,
          multiple:true,
          defaultValue: sourceOptions[0].value,
        }),
        form.checkboxGroup('prefix', { label: '名字前缀', options: ['有'], defaultValue: ['有'] }),
        form.checkboxGroup('overwrite', { label: '覆盖已有数据', options: ['覆盖'], defaultValue: [] }),
      ],
      buttons: [t('Insert')],
    }),
    async ({ values }) => {
      const { field, source,overwrite,prefix } = values;
      const ss = (source || []) as string[];
      const tb = table as ITable;
      const isOverwrite = overwrite && (overwrite as any).length > 0;
      const isPrefix = prefix && (prefix as any).length > 0;
      const fd = fieldList.find((item) => item.id === field) as IField;
      if (!fd) {
        uiBuilder.message.error(t('Please select the fields to fill in'));
        return;
      }
      uiBuilder.showLoading(t('Begin execution'));
      const recordIdList = new Set(await tb.getRecordIdList());
      if (!isOverwrite) {
        const fieldValueList = (await fd.getFieldValueList()).map(
          ({ record_id }) => record_id
        );
        fieldValueList.forEach((id) => {
          recordIdList.delete(id!);
        });
      }
      let nickList: any = [];
      nicknameList.forEach((item) => {
        if (ss.includes('all')) {
          nickList = nickList.concat(item.list);
        } else if (ss.includes(item.source)) {
          nickList = nickList.concat(item.list);
        }
      });
      const toSetTask = [...recordIdList].map((recordId) => {

        let prefixText = '';
        if (isPrefix) {
          prefixText = getRandomText(NicknamePrefix) + "的";
        }
        const name = getRandomText(nickList);
        
        return {
          recordId,
          fields: {
            [fd.id]: prefixText + name,
          },
        };
      });
      if (toSetTask.length === 0) {
        uiBuilder.hideLoading();
        uiBuilder.message.warning(t('No data'));
        return;
      }
      uiBuilder.showLoading(
        t('About to insert n random nicknames', { n: toSetTask.length })
      );
      const step = 5000;
      let hasError = false;
      for (let index = 0; index < toSetTask.length; index += step) {
        const element = toSetTask.slice(index, index + step);
        await tb
          .setRecords(element)
          .then(() => {
            // console.log('执行完成');
          })
          .catch((e) => {
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
    }
  );
  uiBuilder.hideLoading();
}

function getRandomInt({ min, max }: { min: number; max: number }) {
  const _max = Math.max(min, max);
  const _min = Math.min(min, max);
  min = Math.ceil(_min);
  max = Math.floor(_max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const initData = async () => {
  console.log('initData - start');
  console.time('getActiveTable');
  const aT = await bitable.base.getActiveTable();
  console.timeEnd('getActiveTable');
  console.time('getFieldMetaListByType');
  const fieldMetaList = await aT.getFieldMetaListByType(FieldType.Text);
  console.timeEnd('getFieldMetaListByType');
  console.time('getFieldListByType');
  const fieldList = await aT.getFieldListByType(FieldType.Text);
  console.timeEnd('getFieldListByType');
  console.time('options');
  const options = fieldMetaList.map((item) => {
    return {
      label: item.name,
      value: item.id,
    };
  });
  console.timeEnd('options');
  console.time('getNickNameList');
  const lang = i18n.language === 'zh' ? 'zh' : 'en';
  let nicknameList: any[] = [];
  const sourceOptions: any[] = [
    {
      label: i18n.language === 'zh' ? '全部' : 'ALL',
      value: 'all',
    },
  ];
  NickNameDataList.forEach((item) => {
    if (item.lang === lang || (!item.lang && lang === 'zh')) {
      nicknameList.push(item);
      sourceOptions.push({
        label: item.source,
        value: item.source,
      });
    }
  }, []);
  console.timeEnd('getNickNameList');
  return {
    options,
    table: aT,
    fieldList,
    nicknameList,
    sourceOptions,
  };
};

const getRandomText = (list:string[]) => {
  const r = getRandomInt({
    min: 0,
    max: list.length - 1,
  });
  return list[r] || '';
};
