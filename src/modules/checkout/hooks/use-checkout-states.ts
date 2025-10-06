import { parseAsBoolean, parseAsString, useQueryStates } from "nuqs";

export const useCheckoutStates = () => {
  return useQueryStates({
    success: parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    }),
    cancel: parseAsBoolean.withDefault(false).withOptions({
      clearOnDefault: true,
    }),
    partnerCode: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    requestId: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    orderId: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
    signature: parseAsString
      .withDefault("")
      .withOptions({ clearOnDefault: true }),
  });
};
