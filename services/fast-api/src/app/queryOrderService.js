const orders = [
  {
    id: '1',
    customer: '101',
    order_number: 'ORD001',
    order_date: '2024-01-16',
    order_total: 150.75,
    order_status: 'PROCESSING',
    payment_id: 'PMT001',
  },
  {
    id: '2',
    customer: '102',
    order_number: 'ORD002',
    order_date: '2024-01-17',
    order_total: 200.5,
    order_status: 'SHIPPED',
    payment_id: 'PMT002',
  },
  {
    id: '3',
    customer: '103',
    order_number: 'ORD003',
    order_date: '2024-01-18',
    order_total: 75.25,
    order_status: 'DELIVERED',
    payment_id: 'PMT003',
  },
];

//get all orders
const getAllOrders = async (user) => {
  if (!user) {
    throw new Error('Invalid authorization');
  }
  try {
    return orders;
  } catch (error) {
    //console.error('Error in resolver:', error);
    return {
      error: error.message,
    };
  }
};

export { getAllOrders };
