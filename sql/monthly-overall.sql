SELECT
    month,
    sum(balance) as balance,
    sum(delta) as delta
FROM (
    SELECT 
        account,
        min(balance) AS balance, 
        sum(amount) AS delta, 
        strftime('%Y-%m', timestamp) AS month
    FROM transactions 
    GROUP BY account, month
)
GROUP BY month;