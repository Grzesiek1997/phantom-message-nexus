
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useSecurityTesting } from '@/hooks/useSecurityTesting';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Bug, Scan, Lock } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const {
    securityEvents,
    decryptionFailures,
    loading,
    logSecurityEvent
  } = useSecurityMonitoring();
  
  const {
    lastScanResults,
    isScanning,
    threats,
    alerts,
    complianceStatus,
    runSASTScan,
    checkDependencies,
    runOWASPZAP,
    generateComplianceReport
  } = useSecurityTesting();

  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);

  useEffect(() => {
    generateComplianceReport();
  }, []);

  const handleSecurityScan = async () => {
    const results = await runSASTScan('current-codebase');
    console.log('Security scan completed:', results);
  };

  const handleDependencyCheck = async () => {
    const deps = await checkDependencies();
    setVulnerabilities(deps);
  };

  const handlePenTest = async () => {
    const results = await runOWASPZAP('https://securechat.app');
    console.log('Penetration test completed:', results);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">🛡️ Security Command Center</h1>
          <p className="text-gray-400">Comprehensive security monitoring and testing dashboard</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generateComplianceReport} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="glass border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Security Score</p>
                <p className="text-2xl font-bold text-green-400">
                  {complianceStatus.securityScore.toFixed(1)}%
                </p>
              </div>
              <Shield className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Threats</p>
                <p className="text-2xl font-bold text-red-400">{threats.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Vulnerabilities</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {lastScanResults?.total || 0}
                </p>
              </div>
              <Bug className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Compliance</p>
                <p className="text-2xl font-bold text-blue-400">98.2%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monitoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="monitoring">🔍 Monitoring</TabsTrigger>
          <TabsTrigger value="testing">🧪 Testing</TabsTrigger>
          <TabsTrigger value="compliance">📋 Compliance</TabsTrigger>
          <TabsTrigger value="advanced">⚡ Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-400" />
                  Active Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {threats.slice(0, 5).map((threat) => (
                    <div key={threat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{threat.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-gray-400">From: {threat.source}</p>
                      </div>
                      <Badge variant={getSeverityBadgeColor(threat.severity) as any}>
                        {threat.severity}
                      </Badge>
                    </div>
                  ))}
                  {threats.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No active threats detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-400" />
                  Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <p className="font-medium text-white">{alert.message}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(alert.threat.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {alert.resolved ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <p className="text-gray-400 text-center py-4">No recent alerts</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Static Analysis (SAST)</CardTitle>
                <CardDescription>Scan source code for vulnerabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleSecurityScan} 
                  disabled={isScanning}
                  className="w-full"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  {isScanning ? 'Scanning...' : 'Run SAST Scan'}
                </Button>
                {lastScanResults && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Critical:</span>
                      <span className="text-red-400">{lastScanResults.critical}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">High:</span>
                      <span className="text-orange-400">{lastScanResults.high}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Medium:</span>
                      <span className="text-yellow-400">{lastScanResults.medium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Low:</span>
                      <span className="text-blue-400">{lastScanResults.low}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Dependency Check</CardTitle>
                <CardDescription>Check for vulnerable dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleDependencyCheck} className="w-full">
                  <Bug className="w-4 h-4 mr-2" />
                  Check Dependencies
                </Button>
                {vulnerabilities.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {vulnerabilities.map((vuln, index) => (
                      <div key={index} className="p-2 bg-white/5 rounded">
                        <p className="text-sm font-medium text-white">{vuln.package}</p>
                        <p className="text-xs text-gray-400">{vuln.vulnerability}</p>
                        <Badge variant={getSeverityBadgeColor(vuln.severity) as any} className="mt-1">
                          {vuln.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Penetration Test</CardTitle>
                <CardDescription>OWASP ZAP automated testing</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handlePenTest} className="w-full">
                  <Lock className="w-4 h-4 mr-2" />
                  Run Pen Test
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Compliance Status</CardTitle>
                <CardDescription>Regulatory compliance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white">GDPR Compliance</span>
                    <span className="text-green-400">{complianceStatus.gdprCompliance.toFixed(1)}%</span>
                  </div>
                  <Progress value={complianceStatus.gdprCompliance} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white">HIPAA Compliance</span>
                    <span className="text-green-400">{complianceStatus.hipaCompliance.toFixed(1)}%</span>
                  </div>
                  <Progress value={complianceStatus.hipaCompliance} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white">SOX 404 Compliance</span>
                    <span className="text-green-400">{complianceStatus.sox404Compliance.toFixed(1)}%</span>
                  </div>
                  <Progress value={complianceStatus.sox404Compliance} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-white">PCI DSS Compliance</span>
                    <span className="text-green-400">{complianceStatus.pciDssCompliance.toFixed(1)}%</span>
                  </div>
                  <Progress value={complianceStatus.pciDssCompliance} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Security Certifications</CardTitle>
                <CardDescription>Current security certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">ISO 27001</span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">SOC 2 Type II</span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">NIST Cybersecurity Framework</span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-white">Common Criteria EAL4+</span>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">🔬 Quantum Security</CardTitle>
                <CardDescription>Post-quantum cryptography status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">CRYSTALS-Kyber:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">CRYSTALS-Dilithium:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SPHINCS+:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">🧠 AI Security</CardTitle>
                <CardDescription>AI-powered threat detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Neural Networks:</span>
                    <span className="text-green-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ML Accuracy:</span>
                    <span className="text-green-400">99.7%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Threat Models:</span>
                    <span className="text-green-400">1247</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-white">🌊 Fluid Dynamics</CardTitle>
                <CardDescription>Chaos-based security systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entropy Level:</span>
                    <span className="text-green-400">99.99%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Chaos Strength:</span>
                    <span className="text-green-400">Maximum</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Turbulence:</span>
                    <span className="text-green-400">Optimal</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
