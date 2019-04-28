SELECT 
    sum(amount) AS total, 
    strftime('%Y-%m', timestamp) AS month 
FROM transactions 
GROUP BY month;