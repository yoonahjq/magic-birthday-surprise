
export interface BirthdayData {
  name: string;
  date: string; // YYYY-MM-DD
  sender?: string;
  message?: string;
  photos?: string[]; // Base64 strings
}

export enum AppMode {
  CREATE = 'CREATE',
  SURPRISE = 'SURPRISE'
}

export enum CardStep {
  COUNTDOWN = 0,
  GATHER_LIGHT = 1,
  DECIBEL_BOX = 2, // 新增
  ANIMALS = 3,
  TIME_TRAJECTORY = 4, // 新增
  SCRATCH_PHOTO = 5,
  WISH_WELL = 6,
  CAKE_STACK = 7,
  BLOW_CANDLE = 8,
  AR_PHOTO = 9, // 新增
  FINAL_LETTER = 10
}
