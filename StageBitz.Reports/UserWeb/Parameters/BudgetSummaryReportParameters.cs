﻿namespace StageBitz.Reports.UserWeb.Parameters
{
    public class BudgetSummaryReportParameters
    {
        public int ItemTypeId { get; set; }

        public int ProjectId { get; set; }

        public int UserId { get; set; }

        public string CultureName { get; set; }

        public string SortExpression { get; set; }
    }
}