export const mockPlaceholders = {
  building: {
    id: 'building-id',
    address: '123 Example St',
    riskSummary: []
  },
  user: {
    id: 'user-id',
    role: 'user'
  },
  review: {
    id: 'review-id',
    buildingId: 'building-id',
    userId: 'user-id'
  },
  shortlist: {
    id: 'shortlist-id',
    items: []
  }
};

export function getMockPlaceholderNotes() {
  return [
    'Replace these shapes with real service contracts when the back-end API is defined.'
  ];
}
