import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import moment from 'moment';
import 'moment/locale/vi';
import Colors from '../../constants/Colors';

moment.locale('vi');

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return Colors.success;
    case 'pending':
      return Colors.warning;
    case 'processing':
      return Colors.primary;
    case 'failed':
      return Colors.danger;
    case 'refunded':
      return Colors.info;
    default:
      return Colors.gray;
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'completed':
      return 'check-circle';
    case 'pending':
      return 'clock';
    case 'processing':
      return 'refresh';
    case 'failed':
      return 'times-circle';
    case 'refunded':
      return 'undo';
    default:
      return 'question-circle';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'completed':
      return 'Thành công';
    case 'pending':
      return 'Đang chờ';
    case 'processing':
      return 'Đang xử lý';
    case 'failed':
      return 'Thất bại';
    case 'refunded':
      return 'Hoàn tiền';
    default:
      return 'Không xác định';
  }
};

const getProviderText = (provider) => {
  switch (provider) {
    case 'cod':
      return 'Thanh toán khi nhận hàng';
    case 'vnpay':
      return 'VNPay';
    case 'banking':
      return 'Chuyển khoản ngân hàng';
    default:
      return provider || 'Không xác định';
  }
};

const PaymentHistoryItem = ({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(item)} style={styles.paymentItem}>
      <View style={styles.paymentHeader}>
        <View style={styles.statusContainer}>
          <Icon
            name={getStatusIcon(item.status)}
            type="font-awesome-5"
            size={14}
            color={getStatusColor(item.status)}
            solid
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
        <Text style={styles.dateText}>
          {moment(item.timestamp).format('DD/MM/YYYY HH:mm')}
        </Text>
      </View>

      <View style={styles.paymentDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phương thức:</Text>
          <Text style={styles.detailValue}>{getProviderText(item.provider)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Số tiền:</Text>
          <Text style={styles.detailValue}>
            {item.amount.toLocaleString('vi-VN')}đ
          </Text>
        </View>

        {item.transactionId ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Mã giao dịch:</Text>
            <Text style={styles.detailValue}>{item.transactionId}</Text>
          </View>
        ) : null}

        {item.responseMessage ? (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Thông báo:</Text>
            <Text style={styles.detailValue}>{item.responseMessage}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const PaymentHistorySection = ({ paymentHistory, onViewPaymentDetail }) => {
  if (!paymentHistory || paymentHistory.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có lịch sử thanh toán</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Lịch sử thanh toán</Text>
        <Text style={styles.countText}>{paymentHistory.length} giao dịch</Text>
      </View>
      <FlatList
        data={paymentHistory}
        keyExtractor={(item, index) => `payment-${index}`}
        renderItem={({ item }) => (
          <PaymentHistoryItem item={item} onPress={onViewPaymentDetail} />
        )}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 15,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  countText: {
    fontSize: 14,
    color: Colors.textLight,
  },
  listContainer: {
    paddingBottom: 5,
  },
  paymentItem: {
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  paymentDetails: {
    marginTop: 5,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textLight,
    width: '35%',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.textDark,
    width: '65%',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textLight,
    fontStyle: 'italic',
  },
});

export default PaymentHistorySection; 