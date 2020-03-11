export function createAction(actionType) {
  return (payload = null) => ({
    type: actionType,
    payload
  })
}

export const createApiAction = (actionType, func) => {
  return (
    params = {},
    callback: any = { success: () => {}, failed: () => {} },
    customActionType = actionType,
  ) => async (dispatch) => {
    try {
      dispatch({type: `${customActionType  }_request`, params});
      const data = await func(params);
      dispatch({type: customActionType, params, payload: data});

      callback.success && callback.success({payload: data})
      return data
    } catch (e) {
      dispatch({type: `${customActionType  }_failure`, params, payload: e})

      callback.failed && callback.failed({payload: e})
    }
  }
}
