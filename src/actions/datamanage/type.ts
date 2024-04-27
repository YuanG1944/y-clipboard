const base = 'plugin:database|';

export enum DBManageActEnum {
  CLEAR_HISTORY = base + 'clear_history',
  GET_CONFIG = base + 'get_config',
  SET_CONFIG = base + 'set_config',
}
