SELECT
    day,
    sum(balance) as balance,
    sum(delta) as delta
FROM (
    SELECT 
        account,
        min(balance) AS balance, 
        sum(amount) AS delta, 
        strftime('%Y-%m-%d', timestamp) AS day
    FROM transactions 
    GROUP BY account, day
)
GROUP BY day;