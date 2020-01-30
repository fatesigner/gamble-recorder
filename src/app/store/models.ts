/**
 * models
 */

export interface IStore {
  applicationState: IState;
}

export interface IState {
  // 牌局
  parties: IParty[];
  // 牌友
  partners: IPartner[];
}

export interface IParty {
  id: string;
  title: string;
  datetime: Date;
  partners: IPartner[];
  records: IRecord[];
}

export interface IPartner {
  id: string;
  name: string;
  balance: number;
}

export interface IRecord {
  id: string;
  datetime: Date;
  sums: {
    partner: IPartner;
    diff: number;
  }[];
}
