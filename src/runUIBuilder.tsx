import {
  bitable,
  FieldType,
  IField,
  ITable,
  UIBuilder,
} from '@lark-base-open/js-sdk';
import { UseTranslationResponse } from 'react-i18next';
import RandomIdCard from './idCard';
import i18n from './i18n';
export default async function (
  uiBuilder: UIBuilder,
  { t }: UseTranslationResponse<'translation', undefined>
) {
  // console.log('当前语言',i18n.language);
  uiBuilder.showLoading(t('Getting data'));
  console.time('initData');
  const { options, table, fieldList,dataTypeOptions} =
    await initData({t});
  console.timeEnd('initData');
  console.log('initData-end');
  // console.log('一共有',nicknameList.length,'个昵称');
  // let nicknameListCopy = [...nicknameList];
  if (options.length === 0) {
    uiBuilder.hideLoading();
    uiBuilder.text(t('No field type'));
    return;
  }
  uiBuilder.markdown(`## ${t('title')}`);
  uiBuilder.form(
    (form) => {
      const formItems:any = [
        form.select('field', {
          label: t('Field'),
          options: options,
          defaultValue: options[0].value,
        }),
        form.select('dataType', {
          label: t('dataType'),
          options: dataTypeOptions,
          // multiple: true,
          defaultValue: dataTypeOptions[0].value,
        })
      ]
      formItems.push(form.checkboxGroup('overwrite', {
        label: t('Overwrite existing data'),
        options: [t('cover')],
        defaultValue: [],
      }))
      return {
        formItems,
        buttons: [t('Insert')],
      };
    },
    async ({ values }) => {
      const { field, source, overwrite,dataType } = values;
      const ss = (source || []) as string[];
      const tb = table as ITable;
      const isOverwrite = overwrite && (overwrite as any).length > 0;
      const dType = dataType as string;
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
      const toSetTask = [...recordIdList].map((recordId) => {
        let result = randomData(dType);
        return {
          recordId,
          fields: {
            [fd.id]: result,
          },
        };
      });
      if (toSetTask.length === 0) {
        uiBuilder.hideLoading();
        uiBuilder.message.warning(t('No data'));
        return;
      }
      uiBuilder.showLoading(
        t('About to insert n random data', { n: toSetTask.length })
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

const initData = async ({t}:any) => {
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
  // const lang = isCN() ? 'zh' : 'en';
  return {
    options,
    table: aT,
    fieldList,
    dataTypeOptions:[{
      label:t('Mobile'),
      value:'mobile',
    },{
      label:t('Name'),
      value:'name'
    },
    {
      label:t('IdCard'),
      value:'idCard'
    }
    ]
  };
};

const randomData = (dataType:string) => {
  if (dataType === 'mobile') {
    return randomMobile();
  }
  if (dataType === 'name') {
    return randomName();
  }
  if (dataType === 'idCard') {
    return RandomIdCard();
  }
  return '';
}

const randomMobile = () => {
    const prefixArray = ["134", "135", "136", "137", "138", "139", "150", "151", "152", "157", "158", "159", "182", "183", "184", "187", "188", "147", "130", "131", "132", "155", "156", "185", "186", "145", "133", "153", "180", "181", "189"];
    const prefix = prefixArray[Math.floor(Math.random() * prefixArray.length)];
    let suffix = "";
    for (let i = 0; i < 8; i++) {
      suffix += Math.floor(Math.random() * 10);
    }
    return prefix + suffix;
}

const randomName = () => {
    const lastNameArray = ["赵", "钱", "孙", "李", "周", "吴", "郑", "王", "冯", "陈", "褚", "卫", "蒋", "沈", "韩", "杨", "朱", "秦", "尤", "许", "何", "吕", "施", "张", "孔", "曹", "严", "华", "金", "魏", "陶", "姜", "戚", "谢", "邹", "喻", "柏", "水", "窦", "章", "云", "苏", "潘", "葛", "奚", "范", "彭", "郎", "鲁", "韦", "昌", "马", "苗", "凤", "花", "方", "俞", "任", "袁", "柳", "酆", "鲍", "史", "唐", "费", "廉", "岑", "薛", "雷", "贺", "倪", "汤", "滕", "殷", "罗", "毕", "郝", "邬", "安", "常", "乐", "于", "时", "傅", "皮", "卞", "齐", "康", "伍", "余", "元", "卜", "顾", "孟", "平", "黄", "和", "穆", "萧", "尹", "姚", "邵", "湛", "汪", "祁", "毛", "禹", "狄", "米", "贝", "明", "臧", "计", "伏", "成", "戴", "谈", "宋", "茅", "庞", "熊", "纪", "舒", "屈", "项", "祝", "董", "梁"];
    const compoundSurnameArray = [
      '欧阳',
      '司马',
      '上官',
      '端木',
      '诸葛',
      '东方',
      '独孤',
      '南宫',
      '万俟',
      '闻人',
      '夏侯',
      '皇甫',
      '尉迟',
      '公羊',
      '澹台',
      '公冶',
      '宗政',
      '濮阳',
      '淳于',
      '单于',
      '太叔',
      '申屠',
      '公孙',
      '仲孙',
      '轩辕',
      '令狐',
      '钟离',
      '宇文',
      '长孙',
      '慕容',
      '鲜于',
      '闾丘',
      '司徒',
      '司空',
      '丌官',
      '司寇',
      '仉督',
      '子车',
      '颛孙',
      '端木',
      '巫马',
      '公西',
      '漆雕',
      '乐正',
      '壤驷',
      '公良',
      '拓跋',
      '夹谷',
      '宰父',
      '谷梁',
      '晋楚',
      '阎法',
      '汝鄢',
      '涂钦',
      '段干',
      '百里',
      '东郭',
      '南门',
      '呼延',
      '归海',
      '羊舌',
      '微生',
      '岳帅',
      '缑亢',
      '况后',
      '有琴',
      '梁丘',
      '左丘',
      '东门',
      '西门',
      '商牟',
      '佘佴',
      '伯赏',
      '南宫',
      '墨哈',
      '谯笪',
      '年爱',
      '阳佟',
    ];
    const firstNameArray = ["伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "洋", "艳", "勇", "军", "霞", "刚", "玲", "桂英", "平", "杰", "红", "明", "欣", "兰", "丹", "丽娟", "娟", "颖", "建华", "建国", "建军", "慧", "亮", "云", "健", "国强", "亚男", "利", "小红", "建平", "云峰", "文娟", "永刚", "丽华", "玉梅", "文静", "玉华", "晓华", "丽丽", "晓杰", "晓丽", "世勇", "晓燕", "丽珍", "玉兰", "晓萍", "世杰", "丽娜", "玉珍", "晓娟", "晓军", "世军", "丽丽", "玉华", "晓华", "晓杰", "晓丽", "世勇", "晓燕", "丽珍", "玉兰", "晓萍", "世杰", "丽娜", "玉珍", "晓娟", "晓军", "世军"];
    let lastName = "";
    let firstName = "";
    // 随机决定是否使用复姓
    let useCompoundLastName = Math.random() < 0.2; // 20% 的概率使用复姓
    if (useCompoundLastName) {
      lastName = compoundSurnameArray[Math.floor(Math.random() * compoundSurnameArray.length)];
    } else {
      lastName = lastNameArray[Math.floor(Math.random() * lastNameArray.length)];
    }
    firstName = firstNameArray[Math.floor(Math.random() * firstNameArray.length)];
    return lastName + firstName;
}

const isCN = () => {
  return i18n.language === 'zh';
};
