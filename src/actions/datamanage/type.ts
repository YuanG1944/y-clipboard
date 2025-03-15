const base = '';

export enum DBManageActEnum {
  CLEAR_HISTORY = base + 'clear_history',
  GET_CONFIG = base + 'get_config',
  SET_CONFIG = base + 'set_config',
  RESTART_CLEAR_HISTORY_INTERVAL = base + 'restart_clear_history_interval',
}
