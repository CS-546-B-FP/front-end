export function toPlaceholderPageModel({ title, routeGroup, description, pagePath, todoItems = [] }) {
  return {
    title,
    routeGroup,
    description,
    pagePath,
    todoItems
  };
}

const asArray = (value) => (Array.isArray(value) ? value : []);

const toIdString = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value);
};

const toDisplayString = (value, fallback = '') => {
  if (value === undefined || value === null) {
    return fallback;
  }

  return String(value);
};

const getFullName = ({ firstName, lastName, name, username } = {}) => {
  if (name) return toDisplayString(name);

  const fullName = [firstName, lastName]
    .filter(Boolean)
    .map((part) => String(part).trim())
    .filter(Boolean)
    .join(' ');

  return fullName || toDisplayString(username, '');
};

const normalizeRiskSummary = (building = {}) => {
  const source =
    building.riskSummary && typeof building.riskSummary === 'object'
      ? { ...building.riskSummary }
      : {};
  const hasRiskData =
    Object.keys(source).length > 0 ||
    building.riskLevel !== undefined ||
    building.riskScore !== undefined;

  if (!hasRiskData) {
    return undefined;
  }

  const riskLevel = source.level ?? building.riskLevel;
  const riskScore = source.score ?? building.riskScore;

  if (riskLevel !== undefined && riskLevel !== null && riskLevel !== '') {
    source.level = String(riskLevel).toLowerCase();
  }

  if (riskScore !== undefined && riskScore !== null && riskScore !== '') {
    source.score = Number(riskScore);
  }

  return source;
};

export function toBuildingViewModel(building = {}) {
  const address = toDisplayString(building.streetAddress || building.address);
  const ownerName = toDisplayString(
    building.ownerName ||
      (typeof building.owner === 'object' ? building.owner?.name : building.owner)
  );
  const owner =
    ownerName
      ? {
          ...(typeof building.owner === 'object' ? building.owner : {}),
          name: ownerName,
          _id: encodeURIComponent(ownerName)
        }
      : building.owner;

  return {
    ...building,
    _id: toIdString(building._id || building.id),
    address,
    streetAddress: building.streetAddress || address,
    ownerName,
    owner,
    riskSummary: normalizeRiskSummary(building),
    reviewCount: Number(building.reviewCount || 0),
    averageRating: Number(building.averageRating || 0),
    issueTagFrequency: building.issueTagFrequency || {}
  };
}

export const toBuildingListViewModel = (buildings = []) =>
  asArray(buildings).map(toBuildingViewModel);

export function toBuildingSearchViewModel(apiPayload = {}) {
  const items = asArray(apiPayload.items);
  const total = Number(apiPayload.total ?? items.length);
  const page = Number(apiPayload.page || 1);
  const limit = Number(apiPayload.limit || items.length || 1);
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    buildings: toBuildingListViewModel(items),
    pagination: {
      page,
      total,
      limit,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages,
      prevPage: page - 1,
      nextPage: page + 1
    }
  };
}

export function toAdminBuildingFormViewModel(building = {}) {
  const viewModel = toBuildingViewModel(building);

  return {
    ...viewModel,
    owner: viewModel.ownerName || ''
  };
}

export function toReviewViewModel(review = {}) {
  const user = review.user && typeof review.user === 'object' ? review.user : {};
  const building = review.building && typeof review.building === 'object' ? review.building : {};
  const status = toDisplayString(review.status || 'published');
  const moderationStatus = toDisplayString(review.moderationStatus);
  const author =
    review.author ||
    getFullName({
      firstName: review.firstName || user.firstName,
      lastName: review.lastName || user.lastName,
      name: user.name,
      username: review.username || user.username
    }) ||
    'Anonymous';
  const buildingAddress =
    review.buildingAddress ||
    building.streetAddress ||
    building.address ||
    review.streetAddress ||
    '';

  return {
    ...review,
    _id: toIdString(review._id || review.id),
    buildingId: toIdString(review.buildingId || building._id || building.id),
    userId: toIdString(review.userId || user._id || user.id),
    author,
    buildingAddress,
    text: review.reviewText || review.text || '',
    reviewText: review.reviewText || review.text || '',
    rating: Number(review.rating || 0),
    issueTags: asArray(review.issueTags),
    status,
    moderationStatus,
    isDeleted: review.isDeleted === true || status === 'deleted' || moderationStatus === 'deleted',
    isHidden: review.isHidden === true || status === 'hidden' || moderationStatus === 'hidden',
    isFlagged: review.isFlagged === true || moderationStatus === 'flagged'
  };
}

export const toReviewListViewModel = (reviews = []) =>
  asArray(reviews).map(toReviewViewModel);

export const toAdminReviewListViewModel = toReviewListViewModel;

export function toUserViewModel(user = {}) {
  const role = toDisplayString(user.role || (user.isAdmin ? 'admin' : 'user'), 'user');

  return {
    ...user,
    _id: toIdString(user._id || user.id),
    role,
    isAdmin: user.isAdmin === true || role === 'admin',
    isBanned: user.isBanned === true,
    displayName: getFullName(user) || toDisplayString(user.email)
  };
}

export const toUserListViewModel = (users = []) =>
  asArray(users).map(toUserViewModel);

export const toAdminUserListViewModel = toUserListViewModel;

export function toShortlistItemViewModel(item = {}, building) {
  const buildingId = toIdString(item.buildingId || item._id || item.id);
  const buildingViewModel = building
    ? toBuildingViewModel(building)
    : { _id: buildingId, address: 'Unknown building', borough: '' };

  return {
    ...item,
    _id: buildingId,
    buildingId,
    building: buildingViewModel,
    privateNote: item.privateNote || item.note || ''
  };
}

export function toShortlistViewModel(shortlist = {}) {
  const name = shortlist.shortlistName || shortlist.name || '';

  return {
    ...shortlist,
    _id: toIdString(shortlist._id || shortlist.id),
    name,
    shortlistName: shortlist.shortlistName || name,
    items: asArray(shortlist.items).map((item) => toShortlistItemViewModel(item))
  };
}

export const toShortlistListViewModel = (shortlists = []) =>
  asArray(shortlists).map(toShortlistViewModel);

export function toShortlistDetailViewModel(shortlist = {}, items = []) {
  return {
    ...toShortlistViewModel(shortlist),
    items
  };
}

export function toPortfolioViewModel(ownerName, buildings = []) {
  const mappedBuildings = toBuildingListViewModel(buildings);

  return {
    portfolio: {
      name: ownerName,
      buildingCount: mappedBuildings.length
    },
    buildings: mappedBuildings
  };
}
