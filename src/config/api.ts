import funcUrls from '../../backend/func2url.json';

export const API_URLS = {
  survey: funcUrls.survey,
  products: funcUrls.products,
  orders: funcUrls.orders,
  syncCatalog: funcUrls['sync-catalog'],
  pageBuilder: funcUrls['page-builder'],
  surveySubmitStage: funcUrls['survey-submit-stage']
};

export const getSurveyUrl = (action: 'questions' | 'register' | 'submit' | 'user' | 'status' | 'submit-stage') => {
  return `${API_URLS.survey}?action=${action}`;
};

export const getOrdersUrl = () => {
  return API_URLS.orders;
};