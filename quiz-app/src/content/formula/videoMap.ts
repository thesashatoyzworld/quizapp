// Карта видео: Loom ID → Kinescope embed slug.
// Рендерер (blocks.tsx VideoBlock) строит https://kinescope.io/embed/<slug>.
// Пустой map = откат на Loom-эмбед. Генерируется скриптом:
//   GSD-BRAND/scripts/formula-migrate/gen-videomap.mjs (из video-upload-map.csv).
// НЕ править руками — правь CSV и перегенерируй.

export const VIDEO_MAP: Record<string, string> = {
  '2c05ffb20e764272bd490fb776b44f22': '7StwxgfDcsnzHbyG898Nxr', // Введение
  '77705e4d453c43c78a52a384f4b88c6a': 'mCprAPUA4X8QGiihBqPmpQ', // 1. Правила использования
  'e28d3957668e45ec898802bcda764c2c': '7QrLNUsgNWRrWLj9x4AqeC', // 2. Пошаговый план
  'fb6ad2b2b89a45a4a7a10c15b2a2e2e8': 'n29cR9ptGTcHwB6MhVfQo5', // 4. Траблшутинг
  '976f51454c5441d79d6a28ce387da8c5': 'cQRWeeHNpEpszGBR3HTFuU', // 5. Мой пример
  '39533fd03bc44d55b15bf76732dc6b8e': 'kWhsxj8o1chVwwFViHNUzt', // Пошаговый план - ИЗИ
  '116250b4c7e145a9ae00a9b56e9b2fdb': 'okGW3Fu8m9CppacRYFBbXu', // Пошаговый план - МИД
  '6c217c3d2ce644198fb5bd77f784d664': 'nAvZ2324NHMKRcsbheduhW', // Пошаговый план - ХАРД
  '48696b10f2ed41ef9ee6c04aeff007cb': 'qkijBmRDinzGrvgZiNpray', // Пошаговый план - Органический вайб
  '54ff065a15b94133bf5a15f45dcf3221': 'psUWUqQ1kmumvYWmSjBANQ', // 3.1 Типы контента
  '8856842939e64098bf523a10f477dc28': 'dKdFFci2BsyW6Ykfzrz1js', // 3.2 Форматы контента
  '92897ce2fa0445f2939a2d4a52cecb13': 'cjLXHXE4RJGARK2o6E5ZWj', // 3.3 Элементы / отличительные фишки
  '9c0bb015aeab42189874018521910e14': 'xtnE2LZyb7inu5VFgV2NqZ', // 3.4 Процессы и этапы создания
  '9451651d6bca45f5b403b46bd6be9379': 'hjoBkYm8e9Ac5VifZ288im', // 3.4 Этапы создания - Идеи
  '70c057fa9ac64794a9008b6e4748f43b': 'roBHdZVdPoCDw22BNpodWf', // 3.4 Этапы создания - Сценарии
  '21954a932cc24aa8804c7cd170052ebc': 'bK3D6P1T4PNVggn7up7gis', // 3.4 Этапы создания - Съемка
  '145ea39b5db74fd0b9e7adf06ae43d0e': 'jEEpgnnoWu3f5qQygxuusd', // 3.4 Этапы создания - Монтаж
  'd042e178394d4bdeb6686c2a991c6d21': 'mdC93Xzw5wAPNA1duMQYCt', // 3.4 Этапы создания - Готовность и релиз
  'fe0496ac616c4edab76b30fd30d01d96': 'pVDqs2Mxh97RZTkLvwZP1F', // 3.5 Вирусные ядра
  '2d355715c869459f9856ad4078c5e9cd': 'fStrU3jEt1G1v1p3BzNEFT', // 3.6 Алгоритм
  'e911992a2d5d4823a3146e678fcae698': 'sKbmraEcPcXHmBHjnPTEgD', // 3.7 Контент план
  '024c25de766f47869d5a913634fcaec4': 'iKa7xLMfKD65pYNp7wdS5Z', // 3.8 Оптимизация
  'd8df8959e33e45d1ba7447051cd17083': 'vGSV1y8PBgzXGtTZ5NBRuf', // 3.9 Библия контента (1)
  'b59a7b2d8c0b41d5bf11e0262a16b087': 'tUrf8BesjZx1TGAa7Vbdv2', // 3.9 Библия контента (2)
  'de926fdf794c4eb58ba83a100db49011': '7DUKaRd8apewMpS5nT5GrV', // 3.10 Чек-лист
};
