type LoggedCallback<TIn extends any[], TOut> = (...args: TIn) => Promise<TOut>;

const loggerWrapper = <TIn extends any[], TOut>(
  name: string,
  callback: LoggedCallback<TIn, TOut>
): LoggedCallback<TIn, TOut> => {
  return async (...args: TIn): Promise<TOut> => {
    try {
      return await callback(...args);
    } catch (error) {
      console.error(`Error in ${name}`, error);
      throw error;
    }
  };
};

export default loggerWrapper;
