export default function RandomIdCard() {
    return generateChineseID()
}

function generateChineseID() {
    // 随机生成地区码（前6位）
    var regionCode = getRandomRegionCode();
    // 随机生成出生日期码（8位）
    var birthdayCode = getRandomBirthdayCode();
    // 随机生成顺序码（3位）
    var sequenceCode = getRandomSequenceCode();
    // 计算校验码（最后一位）
    var checkCode = calculateCheckCode(regionCode + birthdayCode + sequenceCode);
    // 组合生成身份证号码
    var chineseID = regionCode + birthdayCode + sequenceCode + checkCode;
    console.log('生成随机值',regionCode,birthdayCode,sequenceCode,checkCode,chineseID)
    return chineseID;
  }
  
  // 随机生成地区码（前6位）
  function getRandomRegionCode() {
    //先只随机固定省份 11-65
    const regionCodes = [
        "110000", "120000", "130000", "140000", "150000", "210000", "220000", "230000", "310000", "320000",
        "330000", "340000", "350000", "360000", "370000", "410000", "420000", "430000", "440000", "450000",
        "460000", "500000", "510000", "520000", "530000", "540000", "610000", "620000", "630000", "640000",
        "650000", "710000", "810000", "820000"
      ];
    return regionCodes[Math.floor(Math.random() * regionCodes.length)];
  }
  
  // 随机生成出生日期码（8位）
  function getRandomBirthdayCode() {
    var start = new Date(1950, 0, 1); // 身份证号码起始日期为1950年1月1日
    var end = new Date(2005, 11, 31); // 身份证号码结束日期为2005年12月31日
    var randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  
    var year = randomDate.getFullYear().toString();
    var month = (randomDate.getMonth() + 1).toString().padStart(2, "0");
    var day = randomDate.getDate().toString().padStart(2, "0");
  
    var birthdayCode = year + month + day;
    return birthdayCode;
  }
  
  // 随机生成顺序码（3位）
  function getRandomSequenceCode() {
    var sequenceCode = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return sequenceCode;
  }
  
  // 计算校验码（最后一位）
  function calculateCheckCode(idNumber:string) {
    var weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; // 加权因子
    var checkDigits = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"]; // 校验码对应值
  
    var sum = 0;
    for (var i = 0; i < weights.length; i++) {
      sum += parseInt(idNumber.charAt(i)) * weights[i];
    }
  
    var checkCodeIndex = sum % 11;
    var checkCode = checkDigits[checkCodeIndex];
    return checkCode;
  }
  function getRandomInt({ min, max }: { min: number; max: number }) {
    const _max = Math.max(min, max);
    const _min = Math.min(min, max);
    min = Math.ceil(_min);
    max = Math.floor(_max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }