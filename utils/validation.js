export function getValidationPlaceholder(feature = 'shared') {
  return {
    feature,
    status: 'placeholder',
    message: 'Validation rules have not been implemented yet.'
  };
}
