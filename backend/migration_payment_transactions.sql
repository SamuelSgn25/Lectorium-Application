CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  phone_number VARCHAR(30) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  mtn_reference UUID UNIQUE NOT NULL,
  mtn_financial_transaction_id VARCHAR(255),
  payer_message TEXT,
  error_message TEXT,
  callback_received_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payment_txn_mtn_ref ON payment_transactions(mtn_reference);
CREATE INDEX IF NOT EXISTS idx_payment_txn_registration ON payment_transactions(registration_id);
CREATE INDEX IF NOT EXISTS idx_payment_txn_status ON payment_transactions(status);
