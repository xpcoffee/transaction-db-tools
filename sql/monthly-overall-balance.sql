SELECT
    sum(balance),
    month
FROM (
    SELECT 
        account,
        min(balance) AS balance, 
        strftime('%Y-%m', timestamp) AS month
    FROM transactions 
    GROUP BY account, month
)
GROUP BY month;