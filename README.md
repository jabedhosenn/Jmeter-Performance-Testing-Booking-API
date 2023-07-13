# Jmeter-Performance-Testing-Booking-API.

Dear, 

I’ve completed performance tests on frequently used APIs for test Apps. 
Test executed for the below-mentioned scenario in server 000.000.000.00. 

10 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 10 And Total Concurrent API requested: 800.
50 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 66.67 And Total Concurrent API requested: 4000.
100 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 133.33 And Total Concurrent API requested: 8000.
500 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 544 And Total Concurrent API requested: 40000.
700 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 580 And Total Concurrent API requested: 56000.
1000 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 431 And Total Concurrent API requested: 80000.
1500 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 814 And Total Concurrent API requested: 120000.
2000 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 486 And Total Concurrent API requested: 160000.
2100 Concurrent Request with 10 Loop Count; Avg TPS for Total Samples is ~ 669 And Total Concurrent API requested: 168000.

While executing 2100 concurrent requests, I found 1548 requests got connection timeout And the error rate is 0.92%. 

Summary: The server can handle almost concurrent 164000 API calls with nearly zero (0) error rate.
